CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  pashword_hash TEXT NOT NULL,
  first_name VARBIT NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  google TEXT NOT NULL
);

CREATE TABLE tmnts (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  bowl_id UUID NOT NULL,
  tmnt_name VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (bowl_id) REFERENCES bowls (id)
);

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  tmnt_id UUID NOT NULL,
  event_name VARCHAR NOT NULL,
  team_size INTEGER NOT NULL,
  games INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (tmnt_id) REFERENCES tmnts (id)
);

CREATE TABLE squads (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  event_id UUID NOT NULL,
  squad_name VARCHAR NOT NULL,
  date DATE NOT NULL,
  time TIME,
  games INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events (id)
);

CREATE TABLE divs (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  event_id UUID NOT NULL,
  div_name VARCHAR NOT NULL,
  hdcp_per DOUBLE NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events (id)
);

CREATE TABLE hdcps (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  div_id UUID NOT NULL,
  hdcp_from INTEGER NOT NULL,
  int_hdcp BOOLEAN NOT NULL,
  game BOOLEAN NOT NULL,
  FOREIGN KEY (div_id) REFERENCES divs (id)
);

CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  tmnt_id UUID NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  average INTEGER NOT NULL,
  usbc VARCHAR NOT NULL,
  FOREIGN KEY (tmnt_id) REFERENCES tmnts (id)
);

CREATE TABLE entries (
  id SERIAL NOT NULL PRIMARY KEY,
  player_id UUID NOT NULL,
  div_id UUID NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players (id),
  FOREIGN KEY (div_id) REFERENCES divs (id)
);

CREATE TABLE games (
  id SERIAL NOT NULL PRIMARY KEY,
  squad_id UUID NOT NULL,
  player_id UUID NOT NULL,
  game_num INTEGER NOT NULL,
  score INTEGER NOT NULL,
  FOREIGN KEY (squad_id) REFERENCES squads (id),
  FOREIGN KEY (player_id) REFERENCES players (id)
);

CREATE TABLE div_features (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  div_id UUID NOT NULL,
  feature VARCHAR NOT NULL,
  FOREIGN KEY (div_id) REFERENCES divs (id)
);

CREATE TABLE bowls (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  bowl_name VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  url VARCHAR NOT NULL
);