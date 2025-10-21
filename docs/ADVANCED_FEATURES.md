# Advanced Features Documentation

This document describes the advanced features implemented in BenefitFinder Phase 2.5, including dark mode, customizable text sizing, print optimization, and keyboard shortcuts.

## 🌙 Dark Mode Support

### Features
- **System Preference Detection**: Automatically detects user's system theme preference
- **Manual Theme Switching**: Users can manually choose between light, dark, or system themes
- **Persistent Storage**: Theme preference is saved in localStorage
- **Smooth Transitions**: All theme changes include smooth transitions for better UX

### Implementation
- `ThemeContext` provides theme management across the application
- `ThemeSwitcher` component offers accessible theme selection
- CSS custom properties and Tailwind dark mode classes for styling
- Automatic application of dark theme to all components

### Usage
```tsx
import { useTheme } from '../contexts/ThemeContext';

const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
```

### Keyboard Shortcut
- `Ctrl + T` (or `Cmd + T` on Mac) toggles between light and dark themes

---

## 📏 Customizable Text Size

### Features
- **Four Size Options**: Small, Medium, Large, Extra Large
- **Accessibility Focused**: Meets WCAG guidelines for text scaling
- **Persistent Storage**: Text size preference saved in localStorage
- **Responsive Scaling**: All text scales proportionally across the application

### Implementation
- `TextSizeContext` manages text size state and application
- `TextSizeControls` component provides intuitive size controls
- CSS custom properties for consistent scaling across components
- Font size multipliers applied to document root for global scaling

### Usage
```tsx
import { useTextSize } from '../contexts/TextSizeContext';

const { textSize, setTextSize, increaseTextSize, decreaseTextSize, resetTextSize } = useTextSize();
```

### Keyboard Shortcuts
- `Ctrl + +` increases text size
- `Ctrl + -` decreases text size
- `Ctrl + 0` resets text size to default

---

## 🖨️ Print Optimization

### Features
- **Comprehensive Print Styles**: Optimized layouts for all components
- **Page Setup**: A4 format with proper margins and headers/footers
- **Content Filtering**: Non-printable elements automatically hidden
- **Accessibility**: Print styles maintain readability and contrast

### Implementation
- Dedicated `print.css` file with extensive print media queries
- Page break controls for optimal document flow
- Print-specific styling for cards, tables, and lists
- Privacy notices and contact information included in printouts

### Print Styles Include
- Results summaries with proper formatting
- Program eligibility cards with status indicators
- Document checklists with checkboxes
- Contact information and resource links
- Privacy notices and disclaimers

---

## ⌨️ Keyboard Shortcuts

### Features
- **Comprehensive Shortcuts**: Cover all major application functions
- **Context Awareness**: Shortcuts disabled when typing in input fields
- **Help Documentation**: Built-in shortcuts help modal
- **Accessibility**: All shortcuts follow standard conventions

### Available Shortcuts

#### Navigation
- `Ctrl + Enter`: Start questionnaire
- `Ctrl + H`: Go to home page
- `Ctrl + R`: View results

#### Accessibility
- `Ctrl + T`: Toggle theme (light/dark)
- `Ctrl + +`: Increase text size
- `Ctrl + -`: Decrease text size
- `Ctrl + 0`: Reset text size

#### Help & Guides
- `F1`: Show welcome tour
- `F2`: Show privacy information
- `F3`: Show quick start guide

### Implementation
- `KeyboardShortcuts` component handles all shortcut registration
- Event listeners with proper cleanup and context checking
- `ShortcutsHelp` modal displays all available shortcuts
- Cross-platform support (Ctrl on Windows/Linux, Cmd on Mac)

---

## 🎯 Mobile Optimizations

### Features
- **Touch-Friendly Controls**: All controls meet minimum touch target requirements
- **Responsive Design**: All components adapt to mobile screen sizes
- **Gesture Support**: Long-press gestures for additional functionality
- **Accessibility**: VoiceOver and TalkBack support

### Implementation
- Mobile-first responsive design approach
- Touch target sizes of 44x44px minimum
- Gesture recognition for mobile-specific interactions
- Optimized layouts for portrait and landscape orientations

---

## 🔧 Technical Implementation

### Context Providers
All advanced features use React Context for state management:

```tsx
<ThemeProvider>
  <TextSizeProvider>
    <App />
  </TextSizeProvider>
</ThemeProvider>
```

### CSS Architecture
- **Custom Properties**: CSS variables for theme and size management
- **Tailwind Integration**: Dark mode classes and responsive utilities
- **Print Styles**: Dedicated print stylesheet with comprehensive coverage
- **Accessibility**: High contrast and reduced motion support

### Component Structure
```
src/
├── contexts/
│   ├── ThemeContext.tsx
│   └── TextSizeContext.tsx
├── components/
│   ├── ThemeSwitcher.tsx
│   ├── TextSizeControls.tsx
│   ├── KeyboardShortcuts.tsx
│   └── ShortcutsHelp.tsx
└── styles/
    └── print.css
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Theme switching works in all components
- [ ] Text size changes apply globally
- [ ] Print preview shows optimized layout
- [ ] All keyboard shortcuts function correctly
- [ ] Mobile controls are accessible
- [ ] Settings persist across browser sessions

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA standards
- [ ] Text scaling doesn't break layouts
- [ ] Focus indicators are visible

---

## 🚀 Future Enhancements

### Planned Features
- **Theme Customization**: Allow users to create custom color schemes
- **Advanced Text Options**: Font family selection and line height adjustment
- **Print Templates**: Multiple print layouts for different use cases
- **Gesture Recognition**: More sophisticated mobile gesture support
- **Voice Commands**: Accessibility feature for voice navigation

### Performance Considerations
- **Lazy Loading**: Load advanced features only when needed
- **Memory Management**: Proper cleanup of event listeners and contexts
- **Bundle Size**: Tree-shaking to minimize impact on application size

---

## 📚 Resources

### WCAG Guidelines
- [WCAG 2.1 Text Spacing](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)
- [WCAG 2.1 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WCAG 2.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)

### Browser Support
- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 88+
- **Print Support**: All modern browsers with print media query support

---

## 🤝 Contributing

When adding new advanced features:

1. **Follow Accessibility Guidelines**: Ensure WCAG 2.1 AA compliance
2. **Add Context Support**: Use existing contexts or create new ones as needed
3. **Include Keyboard Shortcuts**: Add appropriate shortcuts for new features
4. **Test Print Styles**: Ensure new components print correctly
5. **Document Usage**: Update this documentation with new features

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: ✅ Complete
