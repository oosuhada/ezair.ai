-- EZ AIR PostgreSQL schema draft
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique,
  name varchar(100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists airports (
  iata_code char(3) primary key,
  name varchar(255) not null,
  city_name varchar(255),
  country_name varchar(255),
  subtype varchar(30),
  latitude decimal(9,6),
  longitude decimal(9,6),
  raw jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists search_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  session_id varchar(128),
  query_text text,
  parsed_params jsonb,
  trip_type varchar(20) not null default 'ONE_WAY',
  origin_iata char(3),
  destination_iata char(3),
  depart_date date,
  return_date date,
  adults int not null default 1,
  travel_class varchar(30) not null default 'ECONOMY',
  non_stop boolean not null default false,
  result_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists flight_offer_snapshots (
  id uuid primary key default gen_random_uuid(),
  search_request_id uuid references search_requests(id) on delete cascade,
  provider varchar(50) not null default 'AMADEUS',
  provider_offer_id varchar(255),
  airline_code varchar(10),
  airline_name varchar(255),
  origin_iata char(3),
  destination_iata char(3),
  departure_at timestamptz,
  arrival_at timestamptz,
  duration_minutes int,
  stops int,
  price_amount numeric(12,2),
  currency char(3),
  recommendation_score int,
  recommendation_reason text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  preferred_origin_iata char(3),
  prefer_non_stop boolean,
  preferred_travel_class varchar(30),
  max_budget_krw int,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists api_cache (
  cache_key varchar(255) primary key,
  cache_type varchar(50) not null,
  value jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_cache_expires_at on api_cache(expires_at);
create index if not exists idx_search_requests_created_at on search_requests(created_at desc);
create index if not exists idx_flight_offer_snapshots_search_request_id on flight_offer_snapshots(search_request_id);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  search_request_id uuid references search_requests(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  selected_offer_id varchar(255),
  created_at timestamptz not null default now()
);
