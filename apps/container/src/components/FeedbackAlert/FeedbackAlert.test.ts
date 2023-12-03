import { FeedbackAlert } from '.';
import { render, screen } from '@/test-utils';

describe('<FeedbackAlert />', () => {
  test('call ElMessage on mount', () => {
    render(FeedbackAlert);
    expect(
      screen.getByText(
        'Não foi possível buscar as informações, tente novamente mais tarde',
      ),
    ).toBeInTheDocument();
  });
});
