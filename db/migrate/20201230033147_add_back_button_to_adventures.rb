class AddBackButtonToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :back_button, :boolean, default: false, null: false
  end
end
