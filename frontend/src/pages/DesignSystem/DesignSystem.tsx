import { useState } from 'react';
import buttonStyles from '../../styles/button.module.css';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ComponentDefinition, {
  ComponentDefinitionProps,
} from './components/ComponentDefinition';

type ButtonEntry = Omit<ComponentDefinitionProps, 'showSnippets'>;

const buttonEntries: ButtonEntry[] = [
  {
    preview: (
      <button
        className={`${buttonStyles.button} ${buttonStyles.buttonPrimary}`}
        style={{ width: 'auto' }}
      >
        Primary
      </button>
    ),
    snippet: `<button className={\`\${buttonStyles.button} \${buttonStyles.buttonPrimary}\`}>\n  Primary\n</button>`,
    usage:
      "Default action button. Use for last stages in form submissions, confirmations, or anything that isn't permant and requires user action",
  },
  {
    preview: (
      <button
        className={`${buttonStyles.button} ${buttonStyles.buttonPrimary} ${buttonStyles.buttonLarge}`}
        style={{ width: 'auto' }}
      >
        Primary Large
      </button>
    ),
    snippet: `<button className={\`\${buttonStyles.button} \${buttonStyles.buttonPrimary} \${buttonStyles.buttonLarge}\`}>\n  Primary Large\n</button>`,
    usage:
      'Larger variant for buttons, to be used sparingly in main pages, such as for requesting a ride',
  },
  {
    preview: (
      <button
        className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
        style={{ width: 'auto' }}
      >
        Secondary
      </button>
    ),
    snippet: `<button className={\`\${buttonStyles.button} \${buttonStyles.buttonSecondary}\`}>\n  Secondary\n</button>`,
    usage:
      'Use for secondary or cancel actions alongside a primary button, or on interactions that are neutral',
  },
  {
    preview: (
      <button
        className={`${buttonStyles.button} ${buttonStyles.buttonSecondary} ${buttonStyles.buttonLarge}`}
        style={{ width: 'auto' }}
      >
        Secondary Large
      </button>
    ),
    snippet: `<button className={\`\${buttonStyles.button} \${buttonStyles.buttonSecondary} \${buttonStyles.buttonLarge}\`}>\n  Secondary Large\n</button>`,
    usage:
      'Use sparingly in pairs with the Primary Large buttons on main pages if needed',
  },
  {
    preview: (
      <>
        <button
          className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
          style={{ width: '3rem', height: '2.5rem' }}
          aria-label="Previous"
        >
          <NavigateBefore />
        </button>
        <button
          className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
          style={{ width: '3rem', height: '2.5rem' }}
          aria-label="Next"
        >
          <NavigateNext />
        </button>
      </>
    ),
    snippet: `<button\n  className={\`\${buttonStyles.button} \${buttonStyles.buttonSecondary}\`}\n  style={{ width: '3rem', height: '2.5rem' }}\n  aria-label="Previous"\n>\n  <NavigateBefore />\n</button>`,
    usage:
      'Fixed-size square button for icon-only actions like navigation or pagination.',
  },
];

const DesignSystem = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [showSnippets, setShowSnippets] = useState(true);

  return (
    <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => setShowSnippets((s) => !s)}
        className={`${buttonStyles.button} ${
          showSnippets
            ? buttonStyles.buttonPrimary
            : buttonStyles.buttonSecondary
        }`}
        style={{ position: 'fixed', top: '1rem', right: '1rem', width: 'auto' }}
      >
        {showSnippets ? 'Hide Snippets' : 'Show Snippets'}
      </button>

      <h1
        style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2.5rem' }}
      >
        Design System
      </h1>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#707070',
            marginBottom: '1rem',
          }}
        >
          Buttons
        </h2>
        {buttonEntries.map((entry, i) => (
          <ComponentDefinition key={i} {...entry} showSnippets={showSnippets} />
        ))}
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#707070',
            marginBottom: '1rem',
          }}
        >
          Date Picker
        </h2>
        <ComponentDefinition
          preview={
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                slotProps={{
                  textField: {
                    sx: {
                      width: '14rem',
                      '& .MuiInputBase-root': { height: '2.5rem' },
                      '& .MuiInputBase-input': {
                        padding: '0.5rem',
                        paddingX: '1rem',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ddd',
                          transition: 'border 0.1s',
                        },
                      },
                    },
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        border: '1px solid #ddd',
                        boxShadow: 'none',
                      },
                      '& .MuiPickersDay-root': {
                        '&.Mui-selected': {
                          backgroundColor: '#333',
                          '&:hover': { backgroundColor: '#444' },
                        },
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        '&:has(.Mui-selected)': { backgroundColor: '#f5f5f5' },
                      },
                    },
                  },
                }}
                format="MM/dd/yyyy"
              />
            </LocalizationProvider>
          }
          snippet={`import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';\nimport { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';\n\n<LocalizationProvider dateAdapter={AdapterDateFns}>\n  <DatePicker\n    label="Select date"\n    value={date}\n    onChange={(v) => setDate(v)}\n    format="MM/dd/yyyy"\n  />\n</LocalizationProvider>`}
          usage="Controlled date input. Pair with useState<Date | null>. slotProps override MUI defaults to match design tokens."
          showSnippets={showSnippets}
        />
      </section>
    </main>
  );
};

export default DesignSystem;
