class CreateCustomThemes < ActiveRecord::Migration[5.2]
  def change
    create_table :custom_themes do |t|
      t.string :title, null: false
      t.string :background_color
      t.string :border_color
      t.string :intro_image_uid
      t.string :intro_image_name
      t.string :scene_image_uid
      t.string :scene_image_name
      t.string :end_image_name
      t.string :end_image_uid
      t.string :header_font_family
      t.string :header_font_color
      t.string :body_font_family
      t.string :body_font_color
      t.string :choice_font_family
      t.string :choice_font_color
      t.string :button_color
      t.string :button_font_family
      t.string :button_font_color
      t.integer :user_id, null: false

      t.timestamps
    end

    add_index :custom_themes, :user_id
    add_foreign_key :custom_themes, :users, on_delete: :cascade
  end
end
