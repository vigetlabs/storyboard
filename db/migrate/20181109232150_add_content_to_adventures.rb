class AddContentToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :content, :json, default: {}
  end
end
