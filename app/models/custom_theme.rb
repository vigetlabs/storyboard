class CustomTheme < ApplicationRecord
  include Sluggable

  FONTS = [
    ["American Typewriter", "American Typewriter, serif"],
    ["Andale Mono", "Andale Mono, monospace"],
    ["Apple Chancery", "Apple Chancery, cursive"],
    ["Arial", "Arial, sans-serif"],
    ["Arial Narrow", "Arial Narrow, sans-serif"],
    ["Avantgarde", "Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif"],
    ["Blippo", "Blippo, fantasy"],
    ["Bookman", "Bookman, URW Bookman L, serif"],
    ["Bradley Hand", "Bradley Hand, cursive"],
    ["Brush Script MT", "Brush Script MT, Brush Script Std, cursive"],
    ["Chalkduster", "Chalkduster, fantasy"],
    ["Comic Sans MS", "Comic Sans MS, Comic Sans, cursive"],
    ["Courier", "Courier, monospace"],
    ["Courier New", "Courier New, monospace"],
    ["Cursive", "cursive"],
    ["DejaVu Sans Mono", "DejaVu Sans Mono, monospace"],
    ["Didot", "Didot, serif"],
    ["Fantasy", "Fantasy"],
    ["FreeMono", "FreeMono, monospace"],
    ["Georgia", "Georgia, serif"],
    ["Gill Sans", "Gill Sans, sans-serif"],
    ["Helvetica", "Helvetica, sans-serif"],
    ["Impact", "Impact, fantasy"],
    ["Jazz LET", "Jazz LET, fantasy"],
    ["Luminari", "Luminari, fantasy"],
    ["Marker Felt", "Marker Felt, fantasy"],
    ["Monospace", "monospace"],
    ["New Century Schoolbook", "New Century Schoolbook, TeX Gyre Schola, serif"],
    ["Noto Sans", "Noto Sans, sans-serif"],
    ["OCR A Std", "OCR A Std, monospace"],
    ["Optima", "Optima, sans-serif"],
    ["Palatino", "Palatino, URW Palladio L, serif"],
    ["Sans-Serif", "sans-serif"],
    ["Serif", "serif"],
    ["Snell Roundhand", "Snell Roundhand, cursive"],
    ["Stencil Std", "Stencil Std, fantasy"],
    ["Times", "Times, Times New Roman, serif"],
    ["Trattatello", "Trattatello, fantasy"],
    ["Trebuchet MS", "Trebuchet MS, sans-serif"],
    ["URW Chancery L", "URW Chancery L, cursive"],
    ["Verdana", "Verdana, sans-serif"]
  ]

  has_many :adventures

  slug_from :slug_source

  dragonfly_accessor :intro_image
  dragonfly_accessor :scene_image
  dragonfly_accessor :end_image

  belongs_to :user

  validates :title, presence: true

  def to_s
    title
  end

  def to_param
    slug
  end

  private

  def slug_source
    title
  end
end
