class AddNullConstraintToAdventuresTheme < ActiveRecord::Migration[5.2]
  def change
    change_column_null :adventures, :theme, true, "light"
  end
end
