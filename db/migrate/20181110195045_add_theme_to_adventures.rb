class AddThemeToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :theme, :string, default: "light"
  end
end
