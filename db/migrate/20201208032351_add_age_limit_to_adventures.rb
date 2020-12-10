class AddAgeLimitToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :age_limit, :integer, null: true
    add_column :adventures, :has_age_limit, :boolean, default: false, null: false
  end
end
