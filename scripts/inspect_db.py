import sqlite3

conn = sqlite3.connect(r'C:\hackthons\compliance_platform.db')
cursor = conn.cursor()
tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print('Tables in compliance_platform.db:')
for t in tables:
    count = cursor.execute(f'SELECT count(1) FROM "{t}"').fetchone()[0]
    print(f'  {t}: {count} records')

# Let's inspect users schema and records
print("\nUsers table info:")
for col in cursor.execute("PRAGMA table_info(users)").fetchall():
    print(" ", col)
print("\nUsers rows:")
for u in cursor.execute("SELECT * FROM users").fetchall():
    print(" ", u)

# Let's inspect institutions
print("\nInstitutions table info:")
for col in cursor.execute("PRAGMA table_info(institutions)").fetchall():
    print(" ", col)
print("\nInstitutions rows:")
for i in cursor.execute("SELECT * FROM institutions").fetchall():
    print(" ", i)

# Let's inspect documents
print("\nDocuments table info:")
for d in cursor.execute("SELECT id, application_id, document_type, original_filename, processing_status, sha256_hash FROM documents").fetchall():
    print(" ", d)

# Let's inspect findings
print("\nFindings table info:")
for f in cursor.execute("SELECT id, validation_run_id, rule_code, severity, title, review_status FROM findings").fetchall():
    print(" ", f)

# Let's inspect compliance_rules
print("\nCompliance rules:")
for r in cursor.execute("SELECT rule_code, title, category, severity, is_enabled FROM compliance_rules").fetchall():
    print(" ", r)


