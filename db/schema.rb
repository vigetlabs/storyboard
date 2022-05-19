# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_05_19_134603) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "adventures", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "public", default: false
    t.integer "user_id"
    t.json "content", default: {}
    t.string "theme", default: "light"
    t.string "featured"
    t.string "password", default: "", null: false
    t.boolean "has_password", default: false, null: false
    t.boolean "show_source", default: true, null: false
    t.integer "age_limit"
    t.boolean "has_age_limit", default: false, null: false
    t.boolean "back_button", default: false, null: false
    t.boolean "character_card", default: true, null: false
    t.boolean "archived", default: false, null: false
    t.index ["user_id"], name: "index_adventures_on_user_id"
  end

  create_table "audio_tracks", force: :cascade do |t|
    t.string "meta_id"
    t.string "audio_track_uid"
    t.index ["meta_id"], name: "index_audio_tracks_on_meta_id", unique: true
  end

  create_table "photos", force: :cascade do |t|
    t.string "meta_id"
    t.string "image_name"
    t.string "image_uid"
    t.index ["meta_id"], name: "index_photos_on_meta_id", unique: true
  end

  create_table "pointless_feedback_messages", force: :cascade do |t|
    t.string "name"
    t.string "email_address"
    t.string "topic"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "url"
  end

  create_table "thumbnails", force: :cascade do |t|
    t.string "signature", null: false
    t.string "uid", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["signature"], name: "index_thumbnails_on_signature", unique: true
    t.index ["uid"], name: "index_thumbnails_on_uid", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "can_be_emailed", default: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "adventures", "users", on_delete: :cascade
end
