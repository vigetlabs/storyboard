class ChangeStoryToAdventure < ActiveRecord::Migration[5.2]
  def change
    rename_table :adventures, :adventures
  end
end
