class AddCustomThemeIdToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :custom_theme_id, :integer

    add_index :adventures, :custom_theme_id
    add_foreign_key :adventures, :custom_themes, on_delete: :cascade
  end
end
