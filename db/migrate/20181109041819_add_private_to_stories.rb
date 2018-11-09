class AddPrivateToStories < ActiveRecord::Migration[5.2]
  def change
    add_column :stories, :private, :boolean, default: false
  end
end
