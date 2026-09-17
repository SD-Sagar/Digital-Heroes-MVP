import { supabaseAdmin as supabase } from '../config/supabase.js';

export const getCharities = async (req, res) => {
  try {
    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map to old schema
    res.json(charities.map(c => ({
      _id: c.id,
      name: c.name,
      description: c.description,
      category: c.category,
      images: c.images,
      isActive: c.is_active
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCharity = async (req, res) => {
  try {
    const { name, description, category, images } = req.body;
    
    const { data: charity, error } = await supabase
      .from('charities')
      .insert([{ name, description, category, images: images || [] }])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json({
      _id: charity.id,
      name: charity.name,
      description: charity.description,
      category: charity.category,
      images: charity.images,
      isActive: charity.is_active
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCharity = async (req, res) => {
  try {
    const { name, description, category, images, isActive } = req.body;
    
    const { data: charity, error } = await supabase
      .from('charities')
      .update({ name, description, category, images, is_active: isActive })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    
    res.json({
      _id: charity.id,
      name: charity.name,
      description: charity.description,
      category: charity.category,
      images: charity.images,
      isActive: charity.is_active
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCharity = async (req, res) => {
  try {
    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.json({ message: 'Charity removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCharity = async (req, res) => {
  try {
    const { data, error } = await supabase.from('charities').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const selectCharity = async (req, res) => {
  try {
    const { charityId, contributionPercentage } = req.body;
    const { data, error } = await supabase.from('profiles').update({
      charity_id: charityId,
      charity_contribution_percentage: contributionPercentage
    }).eq('id', req.user._id).select().single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySelection = async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('charity_id, charity_contribution_percentage, charities(*)').eq('id', req.user._id).single();
    if (error || !data || !data.charities) {
      return res.json(null);
    }
    res.json({
      charity: {
        _id: data.charities.id,
        name: data.charities.name,
        description: data.charities.description
      },
      contributionPercentage: data.charity_contribution_percentage,
      contributionAmount: 1 // mock amount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
