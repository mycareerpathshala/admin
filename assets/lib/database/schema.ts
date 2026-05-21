import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    real,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const adminRoleEnum         = pgEnum('admin_role',         ['super', 'admin', 'editor', 'counsellor']);
export const genderEnum            = pgEnum('gender',             ['male', 'female', 'non-binary', 'prefer-not-to-say']);
export const studyLevelEnum        = pgEnum('study_level',        ['Undergraduate', 'Postgraduate', 'MBBS']);
export const requestStatusEnum     = pgEnum('request_status',     ['pending', 'scheduled', 'completed', 'cancelled']);
export const applicationStatusEnum = pgEnum('application_status', ['draft', 'submitted', 'under_review', 'offer_received', 'accepted', 'rejected', 'withdrawn']);
export const applicationTypeEnum   = pgEnum('application_type',   ['general', 'mbbs']);
export const notificationTypeEnum  = pgEnum('notification_type',  ['counselling_scheduled', 'counselling_completed', 'counselling_cancelled', 'application_status_updated', 'new_counselling_request', 'new_application']); // extra values kept to match DB (PostgreSQL cannot drop enum values)

// ── Admins ────────────────────────────────────────────────────────────────────

export const admins = pgTable(
    'admins',
    {
        id:           uuid('id').primaryKey().defaultRandom(),
        firstName:    text('first_name').notNull(),
        lastName:     text('last_name').notNull(),
        email:        text('email').notNull().unique(),
        passwordHash: text('password_hash').notNull(),
        adminRole:    adminRoleEnum('admin_role').notNull(),
        avatar:       text('avatar').notNull().default('/img/profile/images/admin_default.png'),
        phone:        text('phone'),
        isVerified:   boolean('is_verified').notNull().default(false),
        createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex('one_super_admin').on(t.adminRole).where(sql`${t.adminRole} = 'super'`),
    ],
);

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable(
    'users',
    {
        id:             uuid('id').primaryKey().defaultRandom(),
        firstName:      text('first_name').notNull(),
        lastName:       text('last_name').notNull(),
        email:          text('email').notNull().unique(),
        passwordHash:   text('password_hash').notNull(),
        avatar:         text('avatar').notNull().default('avatar_01.png'),
        phone:          text('phone'),
        dateOfBirth:    text('date_of_birth'),
        gender:         genderEnum('gender'),
        country:        text('country'),
        secondaryEmail: text('secondary_email'),
        isVerified:     boolean('is_verified').notNull().default(false),
        createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ── Counsellors ───────────────────────────────────────────────────────────────

export const counsellors = pgTable(
    'counsellors',
    {
        id:                     uuid('id').primaryKey().defaultRandom(),
        name:                   text('name').notNull(),
        designation:            text('designation').notNull(),
        bio:                    text('bio').notNull(),
        photo:                  text('photo').notNull(),
        email:                  text('email').notNull().unique(),
        phone:                  text('phone').notNull(),
        experienceYears:        integer('experience_years').notNull().default(0),
        totalSessionsConducted: integer('total_sessions_conducted').notNull().default(0),
        rating:                 real('rating').notNull().default(0),
        isActive:               boolean('is_active').notNull().default(true),
        createdAt:              timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt:              timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index('idx_counsellors_is_active').on(t.isActive),
        check('counsellors_rating_range',         sql`${t.rating} >= 0 AND ${t.rating} <= 5`),
        check('counsellors_experience_years_min', sql`${t.experienceYears} >= 0`),
        check('counsellors_sessions_min',         sql`${t.totalSessionsConducted} >= 0`),
    ],
);

export type Counsellor = typeof counsellors.$inferSelect;
export type NewCounsellor = typeof counsellors.$inferInsert;

// ── Counsellings ──────────────────────────────────────────────────────────────

export const counsellings = pgTable(
    'counsellings',
    {
        id:          uuid('id').primaryKey().defaultRandom(),

        userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        name:       text('name').notNull(),
        email:      text('email').notNull(),
        phone:      text('phone').notNull(),
        studyLevel: studyLevelEnum('study_level').notNull(),
        message:    text('message').notNull(),

        preferredDays:       jsonb('preferred_days').notNull().$type<string[]>(),
        preferredTimeRanges: jsonb('preferred_time_ranges').notNull().$type<string[]>(),

        // Study interests (student-supplied)
        nationality: text('nationality'),
        streams:     jsonb('streams').$type<string[]>(),
        countries:   jsonb('countries').$type<string[]>(),
        courses:     jsonb('courses').$type<string[]>(),

        counsellorId:  uuid('counsellor_id').references(() => counsellors.id, { onDelete: 'set null' }),
        scheduledTime: timestamp('scheduled_time', { withTimezone: true }),
        meetingLink:   text('meeting_link'),
        adminNote:     text('admin_note'),

        status: requestStatusEnum('status').notNull().default('pending'),

        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index('idx_counsellings_user_id').on(t.userId),
        index('idx_counsellings_counsellor_id').on(t.counsellorId),
        index('idx_counsellings_status').on(t.status),
    ],
);

export type Counselling = typeof counsellings.$inferSelect;
export type NewCounselling = typeof counsellings.$inferInsert;

export type WeekDay   = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TimeRange = '10 AM - 12 PM' | '12 PM - 2 PM' | '2 PM - 4 PM' | '4 PM - 6 PM';

// ── Preferences ───────────────────────────────────────────────────────────────

export const preferences = pgTable(
    'preferences',
    {
        id:                   uuid('id').primaryKey().defaultRandom(),
        userId:               uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        name:                 text('name').notNull(),
        countryFilter:        text('country_filter'),
        countryName:          text('country_name'),
        streamFilter:         text('stream_filter'),
        streamName:           text('stream_name'),
        levelFilter:          text('level_filter'),
        deliveryMethodFilter: text('delivery_method_filter'),
        studyLanguageFilter:  text('study_language_filter'),
        courseOfferingFilter: text('course_offering_filter'),
        createdAt:            timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt:            timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index('idx_preferences_user_id').on(t.userId),
    ],
);

export type Preference = typeof preferences.$inferSelect;
export type NewPreference = typeof preferences.$inferInsert;

// ── Applications ──────────────────────────────────────────────────────────────

export const applications = pgTable(
    'applications',
    {
        id:           uuid('id').primaryKey().defaultRandom(),
        userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        universityId: text('university_id').notNull(),
        courseId:     text('course_id'),
        type:         applicationTypeEnum('type').notNull().default('general'),
        status:       applicationStatusEnum('status').notNull().default('submitted'),
        notes:        text('notes'),
        adminNote:    text('admin_note'),
        createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index('idx_applications_user_id').on(t.userId),
        index('idx_applications_university_id').on(t.universityId),
        index('idx_applications_status').on(t.status),
    ],
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

// ── Subscribers ───────────────────────────────────────────────────────────────

export const subscribers = pgTable(
    'subscribers',
    {
        id:        uuid('id').primaryKey().defaultRandom(),
        name:      text('name').notNull(),
        email:     text('email').notNull().unique(),
        phone:     text('phone'),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index('idx_subscribers_email').on(t.email),
    ],
);

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;

// ── Contact Info (singleton row, id = 1) ──────────────────────────────────────

export const contactInfo = pgTable(
    'contact_info',
    {
        id:                   integer('id').primaryKey().default(1),
        email:                text('email'),
        phone:                text('phone'),
        whatsappNumber:       text('whatsapp_number'),
        whatsappDisplay:      text('whatsapp_display'),
        facebookUrl:          text('facebook_url'),
        facebookHandle:       text('facebook_handle'),
        instagramUrl:         text('instagram_url'),
        instagramHandle:      text('instagram_handle'),
        youtubeUrl:           text('youtube_url'),
        youtubeHandle:        text('youtube_handle'),
        linkedinUrl:          text('linkedin_url'),
        linkedinHandle:       text('linkedin_handle'),
        officeHoursDays:      text('office_hours_days'),
        officeHoursTime:      text('office_hours_time'),
        emailResponseTime:    text('email_response_time'),
        whatsappResponseTime: text('whatsapp_response_time'),
        languages:            text('languages'),
        updatedAt:            timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
);

export type ContactInfo = typeof contactInfo.$inferSelect;

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications = pgTable(
    'notifications',
    {
        id:        uuid('id').primaryKey().defaultRandom(),
        userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        type:      notificationTypeEnum('type').notNull(),
        title:     text('title').notNull(),
        message:   text('message').notNull(),
        isRead:    boolean('is_read').notNull().default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index('idx_notifications_user_id').on(t.userId),
        index('idx_notifications_is_read').on(t.isRead),
    ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ── User Settings ─────────────────────────────────────────────────────────────

export const userSettings = pgTable(
    'user_settings',
    {
        userId:                  uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
        inAppApplications:       boolean('in_app_applications').notNull().default(true),
        inAppCounselling:        boolean('in_app_counselling').notNull().default(true),
        newCourseAlerts:         boolean('new_course_alerts').notNull().default(false),
        universityUpdates:       boolean('university_updates').notNull().default(false),
        emailAdmissionDeadlines: boolean('email_admission_deadlines').notNull().default(true),
        emailScholarshipAlerts:  boolean('email_scholarship_alerts').notNull().default(true),
        emailPromotional:        boolean('email_promotional').notNull().default(true),
        emailNewsletter:         boolean('email_newsletter').notNull().default(true),
        emailSpecialOffers:      boolean('email_special_offers').notNull().default(false),
        emailWeeklyDigest:       boolean('email_weekly_digest').notNull().default(false),
        publicProfile:           boolean('public_profile').notNull().default(false),
        showOnlineStatus:        boolean('show_online_status').notNull().default(true),
        shareActivityData:       boolean('share_activity_data').notNull().default(false),
        updatedAt:               timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
);

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
