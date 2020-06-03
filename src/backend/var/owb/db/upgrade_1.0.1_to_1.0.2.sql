ALTER TABLE internalfile ADD COLUMN description TEXT;
ALTER TABLE internalfile ADD COLUMN is_visible INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE internalfile ADD COLUMN wb_download_date TEXT;
UPDATE node SET footer = replace(footer, 'v1.0.1', 'v1.0.2');