# GitHub Copilot Instructions for Illusion

## 🎮 Project Context
This is a Pokémon Essentials v21+ project called "Illusion". It's a Ruby-based Pokémon fan game with extensive customization.

## 🏗️ Project Structure

### Core Technologies
- **Ruby 3.0+**: Main scripting language
- **RPG Maker XP**: Game engine base
- **MKXP**: Modern runtime engine
- **JavaScript**: Web-based Pokédex

### Key Directories
- `/Plugins/`: Ruby plugins for game mechanics
- `/PBS/`: Text-based data files (Pokémon, moves, items, etc.)
- `/Graphics/`: Sprites, tilesets, UI elements
- `/Audio/`: Music and sound effects
- `/Data/`: Compiled game data
- `/pokemon/`: Generated Pokédex web pages

## 💻 Coding Standards

### Ruby Code
```ruby
# Use Pokémon Essentials conventions
# Follow RuboCop rules in .rubocop.yml
# Use snake_case for methods and variables
# Use PascalCase for classes

# Example plugin structure:
class MyPlugin
  def self.register
    # Plugin registration code
  end
end
```

### PBS Files Format
```
[POKEMON_SYMBOL]
Name = Pokemon Name
Types = TYPE1,TYPE2
BaseStats = HP,ATK,DEF,SPD,SPATK,SPDEF
Abilities = ABILITY1,ABILITY2
HiddenAbility = HIDDEN_ABILITY
```

### Naming Conventions
- Plugin files: `[###] Plugin Name.rb`
- PBS files: `lowercase_underscored.txt`
- Constants: `UPPER_SNAKE_CASE`
- Methods: `snake_case`

## 🎯 When Suggesting Code

### DO:
- ✅ Follow Pokémon Essentials v21 API
- ✅ Add comments for complex logic
- ✅ Consider compatibility with existing plugins
- ✅ Use existing helper methods from Essentials
- ✅ Handle edge cases (nil checks, type validation)
- ✅ Keep performance in mind

### DON'T:
- ❌ Use deprecated v20 methods
- ❌ Hardcode values (use PBS files instead)
- ❌ Ignore RuboCop warnings
- ❌ Create circular dependencies
- ❌ Use eval() or other unsafe methods

## 🔌 Common Patterns

### Event Handlers
```ruby
EventHandlers.add(:on_wild_pokemon_created, :my_handler,
  proc { |pokemon|
    # Modify wild Pokémon
  }
)
```

### Battle Mechanics
```ruby
class Battle::Move::MyMove < Battle::Move
  def pbEffectAfterAllHits(user, target)
    # Custom move effect
  end
end
```

### PBS Data Access
```ruby
species_data = GameData::Species.get(:PIKACHU)
move_data = GameData::Move.get(:THUNDERBOLT)
```

## 🐛 Debugging

### Common Issues
1. Check script compilation errors
2. Verify PBS file syntax
3. Look for circular plugin dependencies
4. Check event handler priorities
5. Validate graphics file paths

### Debug Commands (in-game)
- `F12`: Soft reset
- `F8`: Screenshot
- Debug menu available in development

## 📚 Key Resources

### Essentials Documentation
- Official Wiki: Pokémon Essentials documentation
- Plugin structure follows v21 conventions
- Use `GameData` classes for data access

### This Project's Specifics
- Custom plugins in `/Plugins/`
- Web Pokédex generated from game data
- Automated CI/CD with GitHub Actions
- German and English translations supported

## 🎨 Styling Guidelines

### UI Elements
- Follow existing UI style
- Use proper text formatting codes
- Consider mobile compatibility for web assets

### Graphics
- Sprites: PNG format, transparent background
- Follow Essentials naming conventions
- Keep file sizes reasonable

## 🔒 Security

### Never Suggest:
- Hardcoded secrets or API keys
- Unsafe file operations
- SQL injection vulnerabilities
- Unvalidated user input

### Always Consider:
- Input validation
- Type checking
- Error handling
- Safe file paths

## 🚀 Performance

### Optimize:
- Cache expensive calculations
- Use lazy loading where appropriate
- Minimize file I/O in loops
- Profile before optimizing

### Avoid:
- Unnecessary array/hash copies
- Excessive string concatenation
- Nested loops over large datasets
- Loading all graphics at once

## 🧪 Testing

### Suggest Tests For:
- New battle mechanics
- PBS data validation
- Plugin compatibility
- Edge cases

### Test In-Game:
- Start new save
- Load existing save
- Battle scenarios
- Evolution/level up
- Trading/interactions

## 📦 Plugin Development

### Plugin Template
```ruby
#===============================================================================
# Plugin Name
# Version: 1.0.0
# Description: What this plugin does
#===============================================================================

module MyPlugin
  VERSION = "1.0.0"
  
  # Configuration
  CONFIG = {
    enabled: true
  }
end

# Plugin code here
```

## 🌍 Localization

### Text Files
- Support both German and English
- Use `_INTL()` for translatable text
- Keep translations in sync

### Example
```ruby
pbMessage(_INTL("Hello, {1}!", player.name))
```

## 🎯 Priority Areas

When suggesting improvements, prioritize:
1. 🐛 Bug fixes
2. ⚡ Performance optimizations
3. 📚 Documentation
4. ✨ New features
5. 🎨 UI/UX improvements

## 💡 Best Practices

- Write self-documenting code
- Use meaningful variable names
- Keep methods focused and small
- DRY (Don't Repeat Yourself)
- Comment WHY, not WHAT
- Test changes in-game before committing

---

**Remember**: This is a fan project with love for Pokémon! Keep suggestions fun, creative, and true to the Pokémon spirit! 🌟
