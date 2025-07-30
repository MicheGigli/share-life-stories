-- Fix the badge insertion with proper escaping
INSERT INTO public.badges (name, description, category, condition_type, condition_value, rarity) VALUES
('Prima Parola', 'Hai pubblicato il tuo primo commento', 'attività', 'first_comment', 1, 'common'),
('Critico in Erba', 'Hai scritto la tua prima recensione', 'attività', 'first_experience', 1, 'common'),
('Pioggia di Like', 'Hai ricevuto 50 like totali', 'popolarità', 'likes_received', 50, 'rare'),
('Voce della Community', 'Hai pubblicato 50 commenti', 'interazione', 'comments_count', 50, 'rare'),
('Inarrestabile', 'Hai raggiunto 1000 punti totali', 'fedeltà', 'total_points', 1000, 'epic'),
('Like a chi piace', 'Hai messo 100 like ad altri utenti', 'interazione', 'likes_given', 100, 'rare'),
('Chiacchierone', 'Hai pubblicato 10 commenti', 'interazione', 'comments_count', 10, 'common'),
('Influencer', 'Hai ricevuto 100 like totali', 'popolarità', 'likes_received', 100, 'epic'),
('Veterano', 'Hai raggiunto 2000 punti totali', 'fedeltà', 'total_points', 2000, 'legendary'),
('Esperto', 'Hai pubblicato 10 esperienze', 'attività', 'experiences_count', 10, 'rare'),
('Maestro LifeSharer', 'Hai raggiunto 5000 punti totali', 'fedeltà', 'total_points', 5000, 'legendary'),
('Cuore d''Oro', 'Hai dato 250 like ad altri utenti', 'interazione', 'likes_given', 250, 'epic'),
('Leggenda Vivente', 'Hai raggiunto 10000 punti totali', 'fedeltà', 'total_points', 10000, 'legendary'),
('Narratore', 'Hai pubblicato 5 esperienze', 'attività', 'experiences_count', 5, 'common'),
('Popolare', 'Hai ricevuto 25 like totali', 'popolarità', 'likes_received', 25, 'common'),
('Generoso', 'Hai dato 50 like ad altri utenti', 'interazione', 'likes_given', 50, 'common'),
('Conversatore', 'Hai pubblicato 25 commenti', 'interazione', 'comments_count', 25, 'common');