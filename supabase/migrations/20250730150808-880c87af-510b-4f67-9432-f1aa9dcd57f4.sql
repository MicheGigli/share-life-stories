-- Create sample badges for the gamification system
INSERT INTO public.badges (name, description, category, condition_type, condition_value, rarity, image_url) VALUES
('Primo Passo', 'Hai pubblicato la tua prima esperienza', 'engagement', 'first_experience', 1, 'common', '/badges/first-step.svg'),
('Chiacchierone', 'Hai scritto il tuo primo commento', 'engagement', 'first_comment', 1, 'common', '/badges/chatty.svg'),
('Popolare', 'Hai ricevuto 10 like', 'social', 'likes_received', 10, 'rare', '/badges/popular.svg'),
('Esperto', 'Hai pubblicato 5 esperienze', 'content', 'experiences_count', 5, 'rare', '/badges/expert.svg'),
('Influencer', 'Hai ricevuto 50 like', 'social', 'likes_received', 50, 'epic', '/badges/influencer.svg'),
('Scrittore', 'Hai pubblicato 10 esperienze', 'content', 'experiences_count', 10, 'epic', '/badges/writer.svg'),
('Leggenda', 'Hai raggiunto 1000 punti', 'achievement', 'total_points', 1000, 'legendary', '/badges/legend.svg'),
('Socializzatore', 'Hai dato 25 like', 'social', 'likes_given', 25, 'rare', '/badges/socializer.svg'),
('Commentatore', 'Hai scritto 20 commenti', 'engagement', 'comments_count', 20, 'rare', '/badges/commenter.svg'),
('Maestro', 'Hai raggiunto 500 punti', 'achievement', 'total_points', 500, 'epic', '/badges/master.svg'),
('Veterano', 'Hai pubblicato 25 esperienze', 'content', 'experiences_count', 25, 'legendary', '/badges/veteran.svg'),
('Amato', 'Hai ricevuto 100 like', 'social', 'likes_received', 100, 'legendary', '/badges/beloved.svg'),
('Conversatore', 'Hai scritto 50 commenti', 'engagement', 'comments_count', 50, 'epic', '/badges/conversationalist.svg'),
('Generoso', 'Hai dato 50 like', 'social', 'likes_given', 50, 'epic', '/badges/generous.svg'),
('Punto di Riferimento', 'Hai raggiunto 250 punti', 'achievement', 'total_points', 250, 'rare', '/badges/reference.svg'),
('Produttivo', 'Hai pubblicato 15 esperienze', 'content', 'experiences_count', 15, 'rare', '/badges/productive.svg'),
('Stella', 'Hai ricevuto 25 like', 'social', 'likes_received', 25, 'rare', '/badges/star.svg');