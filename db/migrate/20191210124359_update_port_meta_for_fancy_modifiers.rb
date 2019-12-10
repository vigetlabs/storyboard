class UpdatePortMetaForFancyModifiers < ActiveRecord::Migration[5.2]
  def up
    Adventure.find_each do |adventure|
      port_meta = adventure.content["portMeta"]

      next if !port_meta

      port_meta.each do |port_id, old_meta|
        new_meta = {}

        if old_meta["addsModifier"].present?
          new_meta["itemChanges"] = [
            {
              name: old_meta["addsModifier"],
              action: "add"
            }
          ]
        end

        if old_meta["showIf"].present?
          new_meta["showIfItems"] = [
            {
              name: old_meta["showIf"],
              hasIt: true
            }
          ]
        end

        if old_meta["showUnless"].present?
          new_meta["showIfItems"] = [
            {
              name: old_meta["showUnless"],
              hasIt: false
            }
          ]
        end

        port_meta[port_id] = new_meta
      end
    end
  end

  def down
    # no op
  end
end
