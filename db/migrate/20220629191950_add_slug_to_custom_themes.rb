class AddSlugToCustomThemes < ActiveRecord::Migration[5.2]
  def change
    add_column :custom_themes, :slug, :string, null: false
  end
end
