CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP default current_timestamp,
    updated_at TIMESTAMP default current_timestamp
);

INSERT INTO tickets (title, description, contact_name, contact_email, contact_phone, status) VALUES
('Cannot login', 'User cannot log in with correct credentials.', 'John Doe', 'john.doe@example.com', '123-456-7890', 'pending'),
('Bug in checkout', 'Error when proceeding to checkout.', 'Jane Smith', 'jane.smith@example.com', '987-654-3210', 'accepted'),
('Feature request: Dark mode', 'Would love to have a dark mode option.', 'Alice Johnson', 'alice.johnson@example.com', '555-123-4567', 'resolved'),
('Payment failed', 'Payment keeps failing when using Visa card.', 'Bob Williams', 'bob.williams@example.com', '444-987-6543', 'rejected'),
('Mobile app crashes', 'App crashes on Android 12 when opening settings.', 'Charlie Brown', 'charlie.brown@example.com', '333-222-1111', 'pending'),
('Slow loading times', 'The dashboard takes too long to load.', 'Diana Prince', 'diana.prince@example.com', '222-333-4444', 'accepted'),
('Password reset issue', 'Password reset email not received.', 'Ethan Hunt', 'ethan.hunt@example.com', '666-777-8888', 'resolved'),
('UI issue on Safari', 'Buttons are misaligned on Safari browser.', 'Fiona Gallagher', 'fiona.g@example.com', '111-222-3333', 'pending'),
('Database timeout', 'Database queries are timing out frequently.', 'George Costanza', 'george.c@example.com', '999-888-7777', 'accepted'),
('Error 500 on profile page', 'Internal server error occurs on profile page.', 'Hank Schrader', 'hank.s@example.com', '777-666-5555', 'rejected');
