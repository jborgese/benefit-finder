# Keyboard Navigation Guide

**Status:** ✅ Complete - WCAG 2.1 AA Compliant
**Last Updated:** December 2024

## Overview

Comprehensive keyboard navigation implementation for all questionnaire input components. This guide covers the standardized keyboard navigation patterns, accessibility features, and implementation details.

## Standardized Keyboard Navigation

### Universal Navigation Keys

All input components support these standardized keyboard shortcuts:

| Key | Action | Description |
|-----|--------|-------------|
| `↑` / `↓` | Navigate options | Move between selectable options |
| `←` / `→` | Navigate options | Alternative navigation (horizontal layouts) |
| `Home` | First option | Jump to first selectable option |
| `End` | Last option | Jump to last selectable option |
| `Enter` | Select/Submit | Select focused option or submit question |
| `Space` | Select/Submit | Alternative selection method |
| `Tab` | Next element | Standard tab navigation |
| `Shift+Tab` | Previous element | Reverse tab navigation |

### Component-Specific Navigation

#### SelectInput (Radio Buttons)
- **Arrow Keys**: Navigate between radio options
- **Enter/Space**: Select focused option
- **Visual Focus**: Highlighted border and ring around focused option
- **Wrap Navigation**: Arrow keys wrap from last to first option

#### MultiSelectInput (Checkboxes & Pills)
- **Arrow Keys**: Navigate between checkbox/pill options
- **Enter/Space**: Toggle focused option selection
- **Visual Focus**: Highlighted border and ring around focused option
- **Selection State**: Selected options remain visually distinct

#### NumberInput
- **Arrow Up/Down**: Increment/decrement value
- **Enter**: Submit current value
- **Tab**: Navigate to stepper buttons

#### TextInput
- **Enter**: Submit current value
- **Standard text editing**: All standard text input keys

## Implementation Details

### useKeyboardNavigation Hook

The standardized `useKeyboardNavigation` hook provides consistent keyboard navigation across all components:

```typescript
const keyboardNav = useKeyboardNavigation({
  itemCount: options.length,
  enabled: !disabled,
  wrap: true,
  onItemSelect: (index) => {
    // Handle option selection
  },
  onEnterKey: onEnterKey,
});
```

### Focus Management

- **Visual Focus Indicators**: All focused elements show clear visual indicators
- **Focus Trapping**: Modal and dropdown components trap focus appropriately
- **Focus Restoration**: Focus returns to appropriate elements after interactions
- **Screen Reader Support**: All focus changes are announced to screen readers

### Accessibility Features

#### ARIA Support
- `aria-pressed` for toggle buttons
- `aria-describedby` for option descriptions
- `aria-invalid` for validation states
- `role="group"` for option containers

#### Screen Reader Announcements
- Focus changes are announced
- Selection changes are announced
- Validation errors are announced
- Progress updates are announced

## Testing Keyboard Navigation

### Manual Testing Checklist

- [ ] All options are reachable via keyboard
- [ ] Arrow keys navigate between options
- [ ] Enter/Space keys select options
- [ ] Tab navigation works correctly
- [ ] Focus indicators are visible
- [ ] Screen reader announces changes
- [ ] No keyboard traps exist
- [ ] Escape key closes modals/dropdowns

### Automated Testing

```typescript
// Example test for keyboard navigation
test('navigates options with arrow keys', async () => {
  render(<SelectInput options={options} />);

  const firstOption = screen.getByRole('radio', { name: 'Option 1' });
  firstOption.focus();

  fireEvent.keyDown(firstOption, { key: 'ArrowDown' });
  expect(screen.getByRole('radio', { name: 'Option 2' })).toHaveFocus();
});
```

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Keyboard Support
- All modern browsers support the implemented keyboard events
- Fallback handling for older browsers
- Progressive enhancement approach

## Performance Considerations

### Optimization Strategies
- **Debounced Navigation**: Prevents excessive re-renders during rapid navigation
- **Lazy Focus Management**: Only manages focus when necessary
- **Memoized Callbacks**: Prevents unnecessary re-renders
- **Efficient Event Handling**: Minimal event listener overhead

### Memory Management
- **Cleanup**: All event listeners are properly cleaned up
- **Ref Management**: Option refs are efficiently managed
- **State Optimization**: Minimal state updates during navigation

## Troubleshooting

### Common Issues

#### Focus Not Working
- Check if component is disabled
- Verify keyboard navigation is enabled
- Ensure proper tabindex values

#### Screen Reader Issues
- Verify ARIA attributes are correct
- Check for proper labeling
- Ensure focus announcements work

#### Performance Issues
- Check for excessive re-renders
- Verify event listener cleanup
- Monitor memory usage

### Debug Tools

```typescript
// Enable keyboard navigation debugging
const keyboardNav = useKeyboardNavigation({
  // ... options
  debug: process.env.NODE_ENV === 'development'
});
```

## Future Enhancements

### Planned Features
- **Voice Navigation**: Voice command support
- **Gesture Navigation**: Touch gesture support
- **Custom Shortcuts**: User-configurable keyboard shortcuts
- **Navigation History**: Track navigation patterns

### Accessibility Improvements
- **High Contrast Mode**: Enhanced focus indicators
- **Reduced Motion**: Respect user motion preferences
- **Font Size Scaling**: Support for larger fonts
- **Color Blind Support**: Enhanced color contrast

## Resources

### WCAG 2.1 Guidelines
- [Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard-accessible.html)
- [Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)
- [Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Documentation
- [MDN Keyboard Events](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
