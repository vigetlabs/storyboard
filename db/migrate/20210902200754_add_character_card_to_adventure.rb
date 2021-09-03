class AddCharacterCardToAdventure < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :character_card, :boolean, default: true, null: false
  end
end
