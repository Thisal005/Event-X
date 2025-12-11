package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.PriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {

    // Find all unapplied rules for a specific ticket type, ordered by priority
    List<PriceRule> findByTicketTypeIdAndAppliedFalseOrderByPriorityAsc(Long ticketTypeId);

    // Find all rules for a ticket type
    List<PriceRule> findByTicketTypeIdOrderByPriorityAsc(Long ticketTypeId);

    // Find unapplied DATE rules that should trigger (triggerDate <= now)
    @Query("SELECT pr FROM PriceRule pr WHERE pr.conditionType = 'DATE' AND pr.applied = false AND pr.triggerDate <= :now")
    List<PriceRule> findPendingDateRules(@Param("now") LocalDateTime now);

    // Find unapplied SOLD_COUNT rules for a ticket type where sold >= threshold
    @Query("SELECT pr FROM PriceRule pr WHERE pr.ticketType.id = :ticketTypeId AND pr.conditionType = 'SOLD_COUNT' AND pr.applied = false AND pr.soldThreshold <= :soldCount ORDER BY pr.priority ASC")
    List<PriceRule> findTriggeredSoldCountRules(@Param("ticketTypeId") Long ticketTypeId, @Param("soldCount") int soldCount);

    // Get the next unapplied SOLD_COUNT rule (to show "X tickets left at this price")
    @Query("SELECT pr FROM PriceRule pr WHERE pr.ticketType.id = :ticketTypeId AND pr.conditionType = 'SOLD_COUNT' AND pr.applied = false ORDER BY pr.soldThreshold ASC")
    List<PriceRule> findNextSoldCountRule(@Param("ticketTypeId") Long ticketTypeId);

    // Get the next unapplied DATE rule (to show countdown)
    @Query("SELECT pr FROM PriceRule pr WHERE pr.ticketType.id = :ticketTypeId AND pr.conditionType = 'DATE' AND pr.applied = false ORDER BY pr.triggerDate ASC")
    List<PriceRule> findNextDateRule(@Param("ticketTypeId") Long ticketTypeId);
}
