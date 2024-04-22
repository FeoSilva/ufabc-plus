import { render, screen } from '@/test-utils';
import { PlanningYearCard } from '.';

describe('<PlanningYearCard />', () => {
  test('render a performance year card title, subtitle and description', () => {
    render(PlanningYearCard, {
      props: {
        title: 'title',
        description: 'description',
        subtitle: 'subtitle',
        color: 'primary',
        icon: 'mdi-trophy-outline',
      },
    });
    expect(screen.getByText(/^title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/subtitle/i)).toBeInTheDocument();
  });
});
