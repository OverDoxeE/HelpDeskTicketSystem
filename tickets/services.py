from abc import ABC, abstractmethod
from django.utils import timezone
from .models import Ticket

class TicketCommand(ABC):
    @abstractmethod
    def execute(self):
        pass

class ChangeTicketStatusCommand(TicketCommand):
    def __init__(self, ticket: Ticket, new_status: str, performed_by):
        self.ticket = ticket
        self.new_status = new_status
        self.performed_by = performed_by

    def execute(self):
        self.ticket.status = self.new_status
        self.ticket.updated_at = timezone.now()
        self.ticket.save()
        return self.ticket
