import React, { useState } from 'react';
import AgentListPage from './AgentsListPage';
import AgentDetailsPage from './AgentsDetails';

const AgentManagementPage = () => {
    const [selectedAgent, setSelectedAgent] = useState(null);

    // If an agent is selected, show the details page.
    // Pass the selected agent data and a function to go back.
    if (selectedAgent) {
        return (
            <AgentDetailsPage 
                agent={selectedAgent} 
                onBack={() => setSelectedAgent(null)} 
            />
        );
    }
    
    // Otherwise, show the agent list page.
    // Pass a function to handle selecting an agent.
    return (
        <AgentListPage 
            onSelectAgent={(agent) => setSelectedAgent(agent)} 
        />
    );
};

export default AgentManagementPage;