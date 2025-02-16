// cmd/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/Osatee/NIPA_Assignment/internal/config"
	"github.com/Osatee/NIPA_Assignment/internal/handlers"
	"github.com/Osatee/NIPA_Assignment/pkg/database"
	"github.com/gin-gonic/gin"
)

func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

func main() {
	cfg, err := config.New()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	store := database.NewStore(db)
	h := handlers.NewTicketHandler(store)

	go func() {
		for {
			time.Sleep(10 * time.Second)
			if err := db.Ping(); err != nil {
				log.Printf("Database connection lost: %v", err)
			}
		}
	}()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(TimeoutMiddleware(5 * time.Second))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	v1 := r.Group("/api/v1")
	{
		tickets := v1.Group("/tickets")
		{
			tickets.POST("/create", h.CreateTicket)
		}
	}

	log.Fatal(r.Run(":8080"))
}
