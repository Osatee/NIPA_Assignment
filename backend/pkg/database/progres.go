package database

import (
	"context"
	"database/sql"
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
	ID            int          `json:"id"`
	Title         string       `json:"title"`
	Description   string       `json:"description"`
	Contact_Name  string       `json:"contact_name"`
	Contact_Email string       `json:"contact_email"`
	Contact_Phone string       `json:"contact_phone"`
	Status        TicketStatus `json:"status"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

type NewTicket struct {
	ID            int          `json:"id"`
	Title         string       `json:"title"`
	Description   string       `json:"description"`
	Contact_Name  string       `json:"contact_name"`
	Contact_Email string       `json:"contact_email"`
	Contact_Phone string       `json:"contact_phone"`
	Status        TicketStatus `json:"status"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

type TicketDatabase interface {
	CreateTicket(ctx context.Context, ticket NewTicket) (Ticket, error)
	GetTicket(ctx context.Context, status, sortBy, order string) ([]NewTicket, error)
	GetTicketById(ctx context.Context, id int) (*NewTicket, error)
	UpdateTicket(ctx context.Context, id int, ticket NewTicket) (NewTicket, error)
	UpdateTicketStatus(ctx context.Context, id int, status TicketStatus) (*Ticket, error)
	Close() error
	Ping() error
}

type PostgresDB struct {
	*sqlx.DB
	dsn string
}

func (pdb *PostgresDB) GetTicketById(ctx context.Context, id int) (*NewTicket, error) {
	var ticket NewTicket
	query := `
        SELECT id, title, description, contact_name, contact_email, contact_phone, status, created_at, updated_at 
        FROM tickets WHERE id = $1
    `

	row := pdb.DB.QueryRowContext(ctx, query, id)

	err := row.Scan(
		&ticket.ID,
		&ticket.Title,
		&ticket.Description,
		&ticket.Contact_Name,
		&ticket.Contact_Email,
		&ticket.Contact_Phone,
		&ticket.Status,
		&ticket.CreatedAt,
		&ticket.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("ticket with id %d not found", id)
		}
		return nil, fmt.Errorf("error scanning ticket: %v", err)
	}

	return &ticket, nil
}

func (pdb *PostgresDB) GetTicket(ctx context.Context, status, sortBy, order string) ([]NewTicket, error) {
	var tickets []NewTicket
	query := "SELECT id, title, description, contact_name, contact_email, contact_phone, status, created_at, updated_at FROM tickets"

	if status != "" && status != "all" {
		query += " WHERE status = $1"
	}

	query += fmt.Sprintf(" ORDER BY %s %s", sortBy, order)

	var rows *sql.Rows
	var err error

	if status != "" && status != "all" {
		rows, err = pdb.DB.QueryContext(ctx, query, status)
	} else {
		rows, err = pdb.DB.QueryContext(ctx, query)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var ticket NewTicket
		err := rows.Scan(&ticket.ID, &ticket.Title, &ticket.Description, &ticket.Contact_Name, &ticket.Contact_Email, &ticket.Contact_Phone, &ticket.Status, &ticket.CreatedAt, &ticket.UpdatedAt)
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, ticket)
	}

	return tickets, nil
}

func (pdb *PostgresDB) CreateTicket(ctx context.Context, ticket NewTicket) (Ticket, error) {
	var createdTicket Ticket
	err := pdb.DB.QueryRowContext(ctx, `
		INSERT INTO tickets (title, description, contact_name, contact_email, contact_phone, status) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING id, title, description, contact_name, contact_email, contact_phone, status, created_at, updated_at
	`,
		ticket.Title, ticket.Description, ticket.Contact_Name, ticket.Contact_Email, ticket.Contact_Phone, ticket.Status,
	).Scan(
		&createdTicket.ID, &createdTicket.Title, &createdTicket.Description, &createdTicket.Contact_Name,
		&createdTicket.Contact_Email, &createdTicket.Contact_Phone, &createdTicket.Status, &createdTicket.CreatedAt,
		&createdTicket.UpdatedAt)
	if err != nil {
		return Ticket{}, fmt.Errorf("failed to create ticket: %v", err) // ✅ แก้ Error message ให้ถูกต้อง
	}
	return createdTicket, nil
}

func (pdb *PostgresDB) UpdateTicket(ctx context.Context, id int, ticket NewTicket) (NewTicket, error) {
	var updatedTicket NewTicket
	query := `
        UPDATE tickets 
        SET title = $1, description = $2, contact_name = $3, contact_email = $4, contact_phone = $5, status = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING id, title, description, contact_name, contact_email, contact_phone, status, created_at, updated_at
    `
	err := pdb.DB.QueryRowContext(ctx, query,
		ticket.Title, ticket.Description, ticket.Contact_Name, ticket.Contact_Email, ticket.Contact_Phone, ticket.Status, id,
	).Scan(
		&updatedTicket.ID, &updatedTicket.Title, &updatedTicket.Description, &updatedTicket.Contact_Name,
		&updatedTicket.Contact_Email, &updatedTicket.Contact_Phone, &updatedTicket.Status, &updatedTicket.CreatedAt,
		&updatedTicket.UpdatedAt,
	)
	if err != nil {
		return NewTicket{}, fmt.Errorf("failed to update ticket: %v", err)
	}
	return updatedTicket, nil
}

func (pdb *PostgresDB) UpdateTicketStatus(ctx context.Context, id int, status TicketStatus) (*Ticket, error) {
	query := `
		UPDATE tickets 
		SET status = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, title, description, contact_name, contact_email, contact_phone, status, created_at, updated_at;
	`

	var ticket Ticket
	err := pdb.DB.QueryRowContext(ctx, query, status, id).Scan(
		&ticket.ID, &ticket.Title, &ticket.Description, &ticket.Contact_Name, &ticket.Contact_Email, &ticket.Contact_Phone,
		&ticket.Status, &ticket.CreatedAt, &ticket.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("ticket with id %d not found", id)
		}
		return nil, fmt.Errorf("failed to update ticket status: %v", err)
	}

	return &ticket, nil
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

func (s *Store) GetTicketById(ctx context.Context, id int) (*NewTicket, error) {
	return s.db.GetTicketById(ctx, id)
}

func (s *Store) GetTicket(ctx context.Context, status, sortBy, order string) ([]NewTicket, error) {
	return s.db.GetTicket(ctx, status, sortBy, order)
}

func (s *Store) CreateTicket(ctx context.Context, ticket NewTicket) (Ticket, error) {
	return s.db.CreateTicket(ctx, ticket)
}

func (s *Store) UpdateTicket(ctx context.Context, id int, ticket NewTicket) (NewTicket, error) {
	return s.db.UpdateTicket(ctx, id, ticket)
}

func (s *Store) UpdateTicketStatus(ctx context.Context, id int, status TicketStatus) (*Ticket, error) {
	return s.db.UpdateTicketStatus(ctx, id, status)
}
