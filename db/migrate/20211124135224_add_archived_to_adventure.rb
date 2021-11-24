class AddArchivedToAdventure < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :archived, :boolean, default: false, null: false
  end
end
