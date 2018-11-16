class ChangePrivateToPublic < ActiveRecord::Migration[5.2]
  def up
    rename_column :adventures, :private, :public

    Adventure.all.each do |adventure|
      adventure.update_attribute(:public, !adventure.public)
    end
  end

  def down
    rename_column :adventures, :public, :private

    Adventure.all.each do |adventure|
      adventure.update_attribute(:private, !adventure.private)
    end
  end
end
