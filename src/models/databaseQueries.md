CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user'
    CHECK (role IN ('user','admin')),
    created_at TIMESTAMP DEFAULT NOW()
);
update app_users set role ='admin' where email='admin@gmail.com'

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(20),
    dob DATE,
    weight NUMERIC(5,2),
    medical_history TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('walk','feeding','play','medication')),
    duration INTEGER,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vet_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    vet_name VARCHAR(100),
    clinic_name VARCHAR(150),
    appointment_date TIMESTAMP NOT NULL,
    purpose TEXT,
    reminder_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'upcoming',
    notes TEXT
);

CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(100) NOT NULL,
    given_date DATE NOT NULL,
    next_due_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE
);
ALTER TABLE vaccinations
ADD COLUMN completed BOOLEAN DEFAULT FALSE;

CREATE TABLE health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    weight NUMERIC(5,2),
    temperature NUMERIC(4,1),
    symptoms TEXT,
    notes TEXT,
    date DATE NOT NULL
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('food','medical','grooming','insurance')),
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL
);

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(150) NOT NULL,
    policy_name VARCHAR(150) NOT NULL,
    premium_amount NUMERIC(10,2) CHECK (premium_amount >= 0),
    coverage_amount NUMERIC(10,2) CHECK (coverage_amount >= 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pet_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
    policy_number VARCHAR(100),
    start_date DATE,
    end_date DATE,
    claim_status VARCHAR(50) DEFAULT 'pending',
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE pet_insurance
ADD CONSTRAINT claim_status_check
CHECK (claim_status IN ('active', 'claimed', 'expired', 'pending'));


CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_time TEXT,          
    food TEXT NOT NULL,       
    portion NUMERIC(5,2),    
    notes TEXT
);




CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE likes
ADD CONSTRAINT unique_like UNIQUE (post_id, user_id);

ALTER TABLE posts
ADD COLUMN likes_count INTEGER DEFAULT 0,
ADD COLUMN comments_count INTEGER DEFAULT 0;

CREATE TABLE playdates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location TEXT,
    event_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE playdate_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playdate_id UUID REFERENCES playdates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
    created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE playdates
ADD COLUMN status VARCHAR(20) DEFAULT 'active';


CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    type VARCHAR(50), -- like, comment, rsvp
    reference_id UUID, -- post_id or playdate_id
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);


-- Increment Likes
CREATE OR REPLACE FUNCTION increment_likes(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql;

-- Decrement Likes
CREATE OR REPLACE FUNCTION decrement_likes(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_comment_count ON comments;

CREATE TRIGGER trigger_increment_comment_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_comment_count();



DROP TRIGGER IF EXISTS trigger_decrement_comment_count ON comments;

CREATE TRIGGER trigger_decrement_comment_count
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION decrement_comment_count();

CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = NEW.post_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = OLD.post_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;