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

interface DebtRelation {
  creditor: string;
  amount: number;
}

interface IndividualBalance {
  name: string;
  paid: number;
  balance: number;
  status: 'owed' | 'owes';
  owes_to: DebtRelation[];
}

interface Transaction {
  date: string;
  type: 'expense' | 'payment';
  amount: number;
  person: string;
  description: string;
  participants: string[];
}

interface SummaryData {
  event: string;
  total_expenses: number;
  attendee_count: number;
  individual_balances: IndividualBalance[];
  transactions: Transaction[];
}

interface SummaryResponse {
  status: string;
  summary: SummaryData | { message: string };
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<SummaryData | { message: string } | null>(null);
  const [currentEvent, setCurrentEvent] = useState<string>('bach weekend');
  const [activeTab, setActiveTab] = useState<'expenses' | 'payments' | 'summary'>('expenses');
  const [showBoot, setShowBoot] = useState<boolean>(true);
  const [attendees, setAttendees] = useState<string[]>([]);

  const [expenseForm, setExpenseForm] = useState<Expense>({
    amount: 0.0,
    person: '',
    description: '',
    event: 'bach weekend',
    participants: []
  });

  const [paymentForm, setPaymentForm] = useState<Payment>({
    amount: 0,
    person: '',
    description: '',
    event: 'bach weekend',
    participants: []
  });

  const [selectedRecipient, setSelectedRecipient] = useState<string>('');

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


const expenseData = {
  ...expenseForm,
  amount: parseFloat(expenseForm.amount.toFixed(2))
};

    console.log('About to send expense:', expenseData);
    console.log('Amount type:', typeof expenseData.amount);
    console.log('Amount value:', expenseData.amount);
    console.log('JSON stringified:', JSON.stringify(expenseData));

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      });
      if (response.ok) {
        setExpenseForm({
          amount: 0.0,
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
      const paymentData = {
        ...paymentForm,
        participants: selectedRecipient ? [selectedRecipient] : []
      };
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (response.ok) {
        setPaymentForm({
          amount: 0,
          person: '',
          description: '',
          event: currentEvent,
          participants: []
        });
        setSelectedRecipient('');
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
        const data: SummaryResponse = await response.json();
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
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0.0 })}
              onFocus={(e) => {
                if (expenseForm.amount === 0) {
                  e.target.select();
                }
              }}
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
              onFocus={(e) => {
                if (paymentForm.amount === 0) {
                  e.target.select();
                }
              }}
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
          <div className="form-group">
            <label>Recipient</label>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="form-select"
            >
              <option value="">Select a recipient...</option>
              {attendees.map((attendee) => (
                <option key={attendee} value={attendee}>
                  {attendee}
                </option>
              ))}
            </select>
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
            {summary === null ? (
              <div>Loading...</div>
            ) : 'message' in summary ? (
              <div className="no-transactions">
                <p>{summary.message}</p>
              </div>
            ) : (
              <div className="detailed-summary">
                <div className="summary-header">
                  <h3>Event: {summary.event}</h3>
                  <div className="summary-stats">
                    <div className="stat">
                      <strong>Total Expenses:</strong> ${summary.total_expenses.toFixed(2)}
                    </div>
                    <div className="stat">
                      <strong>Attendees:</strong> {summary.attendee_count}
                    </div>
                  </div>
                </div>

                <div className="balances-section">
                  <h4>Individual Balances</h4>
                  <div className="balances-grid">
                    {summary.individual_balances.map((balance, index) => (
                      <div key={index} className={`balance-card ${balance.status}`}>
                        <div className="balance-header">
                          <strong>{balance.name}</strong>
                          <span className={`status-badge ${balance.status}`}>
                            {balance.status === 'owed' ? 'Is Owed' : 'Owes Money'}
                          </span>
                        </div>
                        <div className="balance-details">
                          <div>Paid: ${balance.paid.toFixed(2)}</div>
                          <div className={`balance-amount ${balance.balance >= 0 ? 'positive' : 'negative'}`}>
                            Balance: ${balance.balance.toFixed(2)}
                          </div>
                        </div>
                        {balance.owes_to.length > 0 && (
                          <div className="owes-section">
                            <div className="owes-header">Owes:</div>
                            {balance.owes_to.map((debt, debtIndex) => (
                              <div key={debtIndex} className="debt-item">
                                ${debt.amount.toFixed(2)} to {debt.creditor}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {summary.transactions.length > 0 && (
                  <div className="transactions-section">
                    <h4>Recent Transactions</h4>
                    <div className="transactions-list">
                      {summary.transactions.map((transaction, index) => (
                        <div key={index} className={`transaction-item ${transaction.type}`}>
                          <div className="transaction-header">
                            <span className="transaction-date">{transaction.date}</span>
                            <span className={`transaction-type ${transaction.type}`}>
                              {transaction.type === 'expense' ? 'Expense' : 'Payment'}
                            </span>
                            <span className="transaction-amount">
                              ${transaction.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="transaction-details">
                            <div><strong>{transaction.person}</strong> - {transaction.description}</div>
                            <div className="participants">
                              Participants: {transaction.participants.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default App;
