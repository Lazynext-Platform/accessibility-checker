-- Create Scans table
CREATE TABLE IF NOT EXISTS Scans (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    scan_date DATE NOT NULL,
    report_id INTEGER,
    FOREIGN KEY (report_id) REFERENCES Reports (id)
);

-- Create index on url column
CREATE INDEX IF NOT EXISTS idx_scans_url ON Scans (url);