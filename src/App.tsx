import React, { useState, useEffect } from 'react';
import './styles.css';

interface Expense {
  amount: number;
  person: string;
  description: string;
  event: string;
  participants: string[];
}

interface Payment {
  amount: number;
  person: string;
  description: string;
  event: string;
  participants: string[];
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [currentEvent, setCurrentEvent] = useState<string>('team_outing');
  const [activeTab, setActiveTab] = useState<'expenses' | 'payments' | 'summary'>('expenses');
  const [showBoot, setShowBoot] = useState<boolean>(true);
  const [attendees, setAttendees] = useState<string[]>([]);

  const [expenseForm, setExpenseForm] = useState<Expense>({
    amount: 0,
    person: '',
    description: '',
    event: 'team_outing',
    participants: []
  });

  const [paymentForm, setPaymentForm] = useState<Payment>({
    amount: 0,
    person: '',
    description: '',
    event: 'team_outing',
    participants: []
  });

  const [newParticipant, setNewParticipant] = useState<string>('');

  const fetchAttendees = async () => {
    try {
      console.log('Fetching attendees...'); // Debug log

    const url = '/api/attendees';
    console.log('Making request to:', url);
    console.log('Full URL would be:', window.location.origin + url);
      const response = await fetch('/api/attendees');


    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
      if (response.ok) {
        console.log(response);
        const data = await response.json();
        console.log('Received attendees:', data); // Debug log
        setAttendees(data);
    } else {
      console.error('Response not ok:', response.status, response.statusText);
    }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  const addExpense = async () => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      });
      if (response.ok) {
        setExpenseForm({
          amount: 0,
          person: '',
          description: '',
          event: currentEvent,
          participants: []
        });
        fetchSummary();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const addPayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });
      if (response.ok) {
        setPaymentForm({
          amount: 0,
          person: '',
          description: '',
          event: currentEvent,
          participants: []
        });
        fetchSummary();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/summary/${currentEvent}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentEvent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBoot(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const addParticipantToExpense = () => {
    if (newParticipant && !expenseForm.participants.includes(newParticipant)) {
      setExpenseForm({
        ...expenseForm,
        participants: [...expenseForm.participants, newParticipant]
      });
      setNewParticipant('');
    }
  };

  const addAllParticipantsToExpense = () => {
    const availableAttendees = attendees.filter(attendee => !expenseForm.participants.includes(attendee));
    setExpenseForm({
      ...expenseForm,
      participants: [...expenseForm.participants, ...availableAttendees]
    });
  };

  const removeParticipantFromExpense = (participant: string) => {
    setExpenseForm({
      ...expenseForm,
      participants: expenseForm.participants.filter(p => p !== participant)
    });
  };

  return (
    <>
      {showBoot && (
        <div className="boot-sequence">
          <div className="boot-text">
            EXPENSE TRACKER SYSTEM v2.4.1<br/>
            Copyright (c) 2025 Terminal Financial Corp.<br/>
            <br/>
            Initializing systems...<br/>
            Loading expense modules... ✓<br/>
            Loading payment modules... ✓<br/>
            Connecting to database... ✓<br/>
            <br/>
            System ready. Welcome, User.<br/>
          </div>
        </div>
      )}
      <div className="container">
        <h1>$ ./expense_tracker.exe</h1>
      
      <div className="event-input">
        <label>
          Current Event: 
          <input
            type="text"
            value={currentEvent}
            onChange={(e) => setCurrentEvent(e.target.value)}
          />
        </label>
      </div>

      <div className="tabs">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
        >
          Add Expense
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
        >
          Add Payment
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
        >
          View Summary
        </button>
      </div>

      {activeTab === 'expenses' && (
        <div className="card">
          <h2>Add Expense</h2>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Person</label>
            <select
              value={expenseForm.person}
              onChange={(e) => setExpenseForm({ ...expenseForm, person: e.target.value })}
              className="form-select"
            >
              <option value="">Select a person...</option>
              {attendees.map((attendee) => (
                <option key={attendee} value={attendee}>
                  {attendee}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Event</label>
            <input
              type="text"
              value={expenseForm.event}
              onChange={(e) => setExpenseForm({ ...expenseForm, event: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Add Participant</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
                className="form-select"
              >
                <option value="">Select a participant...</option>
                {attendees.filter(attendee => !expenseForm.participants.includes(attendee)).map((attendee) => (
                  <option key={attendee} value={attendee}>
                    {attendee}
                  </option>
                ))}
              </select>
              <button onClick={addParticipantToExpense} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                Add
              </button>
              <button onClick={addAllParticipantsToExpense} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                Add All
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Participants</label>
            <div className="participants">
              {expenseForm.participants.map((participant, index) => (
                <span key={index} className="participant-tag">
                  {participant}
                  <button
                    onClick={() => removeParticipantFromExpense(participant)}
                    className="participant-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button onClick={addExpense} className="btn btn-success">
            Add Expense
          </button>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <h2>Add Payment</h2>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Person</label>
            <select
              value={paymentForm.person}
              onChange={(e) => setPaymentForm({ ...paymentForm, person: e.target.value })}
              className="form-select"
            >
              <option value="">Select a person...</option>
              {attendees.map((attendee) => (
                <option key={attendee} value={attendee}>
                  {attendee}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Event</label>
            <input
              type="text"
              value={paymentForm.event}
              onChange={(e) => setPaymentForm({ ...paymentForm, event: e.target.value })}
            />
          </div>
          <button onClick={addPayment} className="btn btn-primary">
            Add Payment
          </button>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="card">
          <h2>Summary for {currentEvent}</h2>
          <button onClick={fetchSummary} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
            Refresh Summary
          </button>
          <div className="summary-display">
            {summary}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default App;
