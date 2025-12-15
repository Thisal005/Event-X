package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.PromoCode;
import com.oop.EventTicketingSystem.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    public Optional<PromoCode> getPromoCode(String code) {
        return promoCodeRepository.findByCode(code);
    }

    public BigDecimal calculateDiscount(PromoCode promoCode, BigDecimal totalAmount) {
        if (promoCode.getType() == PromoCode.DiscountType.FIXED) {
            return promoCode.getDiscountAmount().min(totalAmount);
        } else {
            // Percentage
            return totalAmount.multiply(promoCode.getDiscountAmount())
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
        }
    }

    public BigDecimal validateAndCalculateDiscount(String code, BigDecimal totalAmount, Long eventId) {
        Optional<PromoCode> promoCodeOpt = promoCodeRepository.findByCode(code);
        if (promoCodeOpt.isEmpty()) {
            throw new RuntimeException("Invalid promo code");
        }
        PromoCode promoCode = promoCodeOpt.get();
        if (!promoCode.isValid()) {
            throw new RuntimeException("Promo code has expired or limit reached");
        }
        
        // Scope Check: Global (null event) OR Matching Event
        if (promoCode.getEvent() != null && !promoCode.getEvent().getId().equals(eventId)) {
            throw new RuntimeException("This promo code is not valid for this event");
        }

        return calculateDiscount(promoCode, totalAmount);
    }

    @Transactional
    public void redeemCode(String code) {
        Optional<PromoCode> promoCodeOpt = promoCodeRepository.findByCode(code);
        if (promoCodeOpt.isPresent()) {
            PromoCode promoCode = promoCodeOpt.get();
            if (promoCode.isValid()) {
                promoCode.incrementUses();
                promoCodeRepository.save(promoCode);
            } else {
                 throw new RuntimeException("Promo code is not valid for redemption");
            }
        }
    }

    // For organizers to create codes
    public PromoCode createPromoCode(PromoCode promoCode) {
        if(promoCodeRepository.findByCode(promoCode.getCode()).isPresent()) {
             throw new RuntimeException("Promo code already exists");
        }
        return promoCodeRepository.save(promoCode);
    }

    @Autowired
    private com.oop.EventTicketingSystem.repository.EventRepository eventRepository;

    @Autowired
    private com.oop.EventTicketingSystem.repository.UserRepository userRepository;

    public java.util.List<PromoCode> getAllPromoCodes() {
        return promoCodeRepository.findAll();
    }
    
    public java.util.List<PromoCode> getOrganizerPromoCodes(Long organizerId) {
        return promoCodeRepository.findByEvent_Organizer_Id(organizerId);
    }

    public java.util.List<PromoCode> getEventPromoCodes(Long eventId) {
        return promoCodeRepository.findByEvent_Id(eventId);
    }
    
    public void deletePromoCode(Long id, Long requesterId, boolean isAdmin) {
        Optional<PromoCode> pcOpt = promoCodeRepository.findById(id);
        if (pcOpt.isPresent()) {
            PromoCode pc = pcOpt.get();
            if (isAdmin) {
                promoCodeRepository.delete(pc);
                return;
            }
            
            // If strictly global (null event), only admin can delete (covered above)
            if (pc.getEvent() == null) {
                throw new RuntimeException("Only admins can delete global promo codes");
            }
            
            // Check if requester is the organizer of the event
            if (!pc.getEvent().getOrganizer().getId().equals(requesterId)) {
                throw new RuntimeException("You are not authorized to delete this promo code");
            }
            
            promoCodeRepository.delete(pc);
        } else {
            throw new RuntimeException("Promo code not found");
        }
    }

    public PromoCode createPromoCodeOfRequest(com.oop.EventTicketingSystem.payload.request.PromoCodeRequest request, Long requesterId, boolean isAdmin) {
        if(promoCodeRepository.findByCode(request.getCode()).isPresent()) {
             throw new RuntimeException("Promo code already exists");
        }
        
        com.oop.EventTicketingSystem.model.Event resultEvent = null;
        if (request.getEventId() != null) {
            resultEvent = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
            
            // Check authorization
            if (!isAdmin) {
                if (!resultEvent.getOrganizer().getId().equals(requesterId)) {
                    throw new RuntimeException("You are not authorized to create promo codes for this event");
                }
            }
        } else {
             if (!isAdmin) {
                 throw new RuntimeException("Only admins can create global promo codes");
             }
        }

        PromoCode pc = new PromoCode();
        pc.setCode(request.getCode());
        pc.setDiscountAmount(request.getDiscountAmount());
        pc.setType(request.getType());
        pc.setMaxUses(request.getMaxUses());
        pc.setExpiryDate(request.getExpiryDate());
        pc.setEvent(resultEvent);
        
        return promoCodeRepository.save(pc);
    }
}
