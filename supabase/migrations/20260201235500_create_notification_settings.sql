CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    days_threshold INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, type)
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for school owners" ON notification_settings
    FOR SELECT USING (auth.uid() IN (
        SELECT owner_id FROM schools WHERE id = notification_settings.school_id
    ));

CREATE POLICY "Enable update access for school owners" ON notification_settings
    FOR UPDATE USING (auth.uid() IN (
        SELECT owner_id FROM schools WHERE id = notification_settings.school_id
    ));

CREATE POLICY "Enable insert access for school owners" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT owner_id FROM schools WHERE id = notification_settings.school_id
    ));
