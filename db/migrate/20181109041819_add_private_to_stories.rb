class AddPrivateToStories < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :private, :boolean, default: false
  end
end
