export const sections = [
  {
    icon: '⛑', title: 'Personal protective equipment',
    text: 'Personal protective equipment (PPE) helps protect you from task hazards. Follow site instructions for required equipment such as safety glasses, gloves or hearing protection.',
    takeaway: 'Inspect PPE before use. Ask your supervisor for a replacement if it is damaged or does not fit.',
  },
  {
    icon: '⚠', title: 'Recognizing workplace hazards',
    text: 'Look for hazards such as spills, damaged equipment and blocked exits. A wet walkway can cause someone to slip.',
    takeaway: 'Keep clear, warn people nearby and report the hazard using the workplace procedure.',
  },
  {
    icon: '☎', title: 'Emergency reporting',
    text: 'Get to a safe place and follow your site’s emergency plan. Use an accessible reporting option provided by your workplace, such as a text alert or a designated contact.',
    takeaway: 'Give the exact location, describe what happened and say whether anyone needs help.',
  },
]

export const questions = [
  {
    prompt: 'What should you do if your required safety glasses are cracked?',
    options: ['Wear them for a short task.', 'Ask for a replacement before starting.', 'Remove them and start work.'],
    correct: 1,
    explanation: 'Damaged PPE should be replaced before you start the task.',
  },
  {
    prompt: 'What should you do when you notice a spill in a busy walkway?',
    options: ['Keep clear, warn others and report it.', 'Walk through to see how slippery it is.', 'Leave it for the next shift.'],
    correct: 0,
    explanation: 'Keeping clear, warning others and reporting the spill helps prevent injuries.',
  },
  {
    prompt: 'Which details should you give when reporting an emergency?',
    options: ['Only your name.', 'Only the time you noticed it.', 'The exact location, what happened and who may need help.'],
    correct: 2,
    explanation: 'Those details help responders locate the emergency and understand what help is needed.',
  },
]
