class ChangeStoryToAdventure < ActiveRecord::Migration[5.2]
  def change
    rename_table :stories, :adventures
  end
end
