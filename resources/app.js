const SUPABASE_URL = 'https://supabase.co' // Replace with your actual project URL
const SUPABASE_ANON_KEY = 'your-anon-key'                  // Replace with your actual anon key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const COUNTER_ID = 'fun-button'
const button = document.getElementById('fun-button')
async function loadInitialCount() {
  const { data, error } = await supabase
    .from('global_counters')
    .select('count')
    .eq('id', COUNTER_ID)
    .single()
    
  if (error) {
    console.error("Error loading initial count:", error)
    button.innerText = "Error loading counter"
    return
  }

  if (data) {
    updateButtonUI(data.count)
  }
}
async function handleButtonClick() {
  button.disabled = true 
  const { error } = await supabase.rpc('increment_counter', { row_id: COUNTER_ID })
  if (error) {
    console.error("Error clicking button:", error)
  }
  button.disabled = false
}
const channel = supabase
  .channel('counter-changes')
  .on(
    'postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'global_counters', 
      filter: `id=eq.${COUNTER_ID}` 
    },
    (payload) => {
      updateButtonUI(payload.new.count)
    }
  )
  .subscribe()
function updateButtonUI(count) {
  button.innerText = `🎉 Pressed ${count} times!`
}
loadInitialCount()
button.addEventListener('click', handleButtonClick)