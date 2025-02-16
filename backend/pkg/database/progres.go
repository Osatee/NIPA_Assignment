package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type TicketStatus string

const (
	StatusPending  TicketStatus = "pending"
	StatusAccepted TicketStatus = "accepted"
	StatusResolved TicketStatus = "resolved"
	StatusRejected TicketStatus = "rejected"
)

type Ticket struct {
	ID          int          `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Contact     string       `json:"contact"`
	Status      TicketStatus `json:"status"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type NewTicket struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Contact     string       `json:"contact"`
	Status      TicketStatus `json:"status"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type TicketDatabase interface {
	CreateTicket(ctx context.Context, ticket NewTicket) (Ticket, error)
	Close() error
	Ping() error
}

type PostgresDB struct {
	*sqlx.DB
	dsn string
}

func (pdb *PostgresDB) CreateTicket(ctx context.Context, ticket NewTicket) (Ticket, error) {
	var createdTicket Ticket
	err := pdb.DB.QueryRowContext(ctx, `
		INSERT INTO tickets (title, description, contact, status) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, title, description, contact, status, created_at, updated_at
	`,
		ticket.Title, ticket.Description, ticket.Contact, ticket.Status,
	).Scan(
		&createdTicket.ID, &createdTicket.Title, &createdTicket.Description, &createdTicket.Contact,
		&createdTicket.Status, &createdTicket.CreatedAt, &createdTicket.UpdatedAt)
	if err != nil {
		return Ticket{}, fmt.Errorf("failed to add product: %v", err)
	}
	return createdTicket, nil
}

func NewPostgresDB(dataSourceName string) (*PostgresDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := sqlx.ConnectContext(ctx, "postgres", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// กำหนดค่า connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	// ทดสอบการเชื่อมต่อ
	if err = db.PingContext(ctx); err != nil {
		db.Close() // ปิดการเชื่อมต่อถ้าไม่สามารถ ping ได้
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresDB{
		DB:  db,
		dsn: dataSourceName,
	}, nil
}

func (db *PostgresDB) Reconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	newDB, err := sqlx.ConnectContext(ctx, "postgres", db.dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// ตั้งค่า connection pool
	newDB.SetMaxOpenConns(25)
	newDB.SetMaxIdleConns(10)
	newDB.SetConnMaxLifetime(5 * time.Minute)

	// ทดสอบการเชื่อมต่อ
	if err = newDB.PingContext(ctx); err != nil {
		newDB.Close() // ปิดการเชื่อมต่อใหม่ถ้าไม่สามารถ ping ได้
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// ปิดการเชื่อมต่อเดิม (ถ้ามี) และกำหนดการเชื่อมต่อใหม่
	if db.DB != nil {
		db.DB.Close()
	}
	db.DB = newDB

	return nil
}

func (db *PostgresDB) Close() error {
	return db.DB.Close()
}

type Store struct {
	db TicketDatabase
}

func NewStore(db TicketDatabase) *Store {
	return &Store{db: db}
}

func (s *Store) CreateTicket(ctx context.Context, ticket NewTicket) (Ticket, error) {
	return s.db.CreateTicket(ctx, ticket)
}
