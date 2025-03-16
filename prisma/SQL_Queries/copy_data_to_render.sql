-- eric's office computer's ip (used in Render.com access control)
69.42.20.49 
Source: 69.42.20.49 / 32
Validate IP address: 69.42.20.49 

commands are typed in a Windows Command Prompt window, (run as admin)
-- log in to database
psql -h localhost -U postgres -d bowling_tmnt

-- log into database with password
set PGPASSWORD=postgres
psql -h localhost -U postgres -d bowling_tmnt

-- export schema and data
cd c:\temp\btdb
set PGPASSWORD=postgres
pg_dump -h localhost -U postgres -d bowling_tmnt --inserts > full_dump_with_inserts.sql

-- import schema and data to render
cd c:\temp\btdb
set PGPASSWORD=AYt00njgfMjQuCVRZfykGVkbMkHVW0v5
psql "sslmode=require host=dpg-cva68h9c1ekc738qur60-a.oregon-postgres.render.com port=5432 user=testname dbname=bowling_tmnt" < full_dump_with_inserts.sql
