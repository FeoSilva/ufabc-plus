import { PendingReviewEnrollment } from '.';
import { render, screen } from '@/test-utils';
import { enrollments } from '@/mocks/enrollments';

describe('<PendingReviewEnrollment />', () => {
  it('render the Pending Review Enrollment with a theorical only subject', async () => {
    render(PendingReviewEnrollment, {
      props: {
        enrollment: enrollments[1],
      },
    });
    expect(
      await screen.findByText(enrollments[1].disciplina),
    ).toBeInTheDocument();
    expect(screen.getByText('teoria')).toBeInTheDocument();
  });
  it('render the Pending Review Enrollment with a pratical only subject', async () => {
    render(PendingReviewEnrollment, {
      props: {
        enrollment: enrollments[30],
      },
    });
    expect(
      await screen.findByText(enrollments[30].disciplina),
    ).toBeInTheDocument();
    expect(screen.getByText('prática')).toBeInTheDocument();
  });
  it('render the Pending Review Enrollment with a theorical and pratical subject', async () => {
    render(PendingReviewEnrollment, {
      props: {
        enrollment: enrollments[0],
      },
    });
    expect(
      await screen.findByText(enrollments[0].disciplina),
    ).toBeInTheDocument();
    expect(screen.getByText('teoria e prática')).toBeInTheDocument();
  });
});
