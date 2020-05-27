class AddShowSourceToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :show_source, :boolean, default: true, null: false
  end
end
