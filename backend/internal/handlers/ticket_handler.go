package handlers

import (
	"net/http"

	ticket "github.com/Osatee/NIPA_Assignment/pkg/database"
	"github.com/gin-gonic/gin"
)

type TicketHandler struct {
	ticketService *ticket.Store
}

func NewTicketHandler(ticketService *ticket.Store) *TicketHandler {
	return &TicketHandler{
		ticketService: ticketService,
	}
}

func (h *TicketHandler) CreateTicket(c *gin.Context) {
	var ticket ticket.NewTicket

	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newTicket, err := h.ticketService.CreateTicket(c.Request.Context(), ticket)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newTicket)
}
