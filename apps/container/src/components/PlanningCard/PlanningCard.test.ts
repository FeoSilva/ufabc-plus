import { render, screen } from '@/test-utils';
import { PlanningCard } from '.';

describe('<PerformanceCard />', () => {
  test('render a planning card title, subtitle and description', () => {
    render(PlanningCard, {
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
