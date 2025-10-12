-- Impostare michele.gigli.1997@gmail.com come amministratore
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = 'b806c96a-569b-477e-9f2c-f63e1d087ba4';