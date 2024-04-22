import { render, screen } from '@/test-utils';
import { PlanningQuadCard } from '.';

describe('<PlanningQuadCard />', () => {
  test('render a performance quad card title, subtitle and description', () => {
    render(PlanningQuadCard, {
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
