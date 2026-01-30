-- Function to get creator name for payments table (Computed Field)
CREATE OR REPLACE FUNCTION public.creator_name(payment_row public.payments)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_name(payment_row.created_by);
$$;

-- Function to get creator name for expenses table (Computed Field)
CREATE OR REPLACE FUNCTION public.creator_name(expense_row public.expenses)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_name(expense_row.created_by);
$$;
