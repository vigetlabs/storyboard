class ChangeFeaturedDefault < ActiveRecord::Migration[5.2]
  def up
    change_column :adventures, :featured, :boolean, default: false
  end

  def down
    change_column :adventures, :featured, :boolean, default: true
  end
end
